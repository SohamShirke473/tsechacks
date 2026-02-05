import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================
// BOARD OPERATIONS
// ============================================================

export const createBoard = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        projectId: v.optional(v.id("projects")), // Link to project for analytics
    },
    handler: async (ctx, args) => {
        const boardId = await ctx.db.insert("kanbanBoards", {
            name: args.name,
            description: args.description,
            createdAt: Date.now(),
        });

        // Create single "To Do" column
        await ctx.db.insert("kanbanColumns", {
            boardId,
            title: "To Do",
            order: 0,
        });

        return boardId;
    },
});

export const getBoards = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("kanbanBoards")
            .withIndex("by_created")
            .order("desc")
            .collect();
    },
});

export const getBoard = query({
    args: { boardId: v.id("kanbanBoards") },
    handler: async (ctx, args) => {
        const board = await ctx.db.get(args.boardId);
        if (!board) return null;

        const columns = await ctx.db
            .query("kanbanColumns")
            .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
            .collect();

        // Sort columns by order
        columns.sort((a, b) => a.order - b.order);

        // Get tasks for each column
        const columnsWithTasks = await Promise.all(
            columns.map(async (column) => {
                const tasks = await ctx.db
                    .query("kanbanTasks")
                    .withIndex("by_column", (q) => q.eq("columnId", column._id))
                    .collect();

                // Sort tasks by order
                tasks.sort((a, b) => a.order - b.order);

                return { ...column, tasks };
            })
        );

        return { ...board, columns: columnsWithTasks };
    },
});

export const deleteBoard = mutation({
    args: { boardId: v.id("kanbanBoards") },
    handler: async (ctx, args) => {
        // Delete all tasks in all columns
        const columns = await ctx.db
            .query("kanbanColumns")
            .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
            .collect();

        for (const column of columns) {
            const tasks = await ctx.db
                .query("kanbanTasks")
                .withIndex("by_column", (q) => q.eq("columnId", column._id))
                .collect();

            for (const task of tasks) {
                await ctx.db.delete(task._id);
            }
            await ctx.db.delete(column._id);
        }

        await ctx.db.delete(args.boardId);
    },
});

// ============================================================
// COLUMN OPERATIONS
// ============================================================

export const createColumn = mutation({
    args: {
        boardId: v.id("kanbanBoards"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const columns = await ctx.db
            .query("kanbanColumns")
            .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
            .collect();

        const maxOrder = columns.length > 0
            ? Math.max(...columns.map(c => c.order))
            : -1;

        return await ctx.db.insert("kanbanColumns", {
            boardId: args.boardId,
            title: args.title,
            order: maxOrder + 1,
        });
    },
});

export const updateColumn = mutation({
    args: {
        columnId: v.id("kanbanColumns"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.columnId, { title: args.title });
    },
});

export const deleteColumn = mutation({
    args: { columnId: v.id("kanbanColumns") },
    handler: async (ctx, args) => {
        // Delete all tasks in column
        const tasks = await ctx.db
            .query("kanbanTasks")
            .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
            .collect();

        for (const task of tasks) {
            await ctx.db.delete(task._id);
        }

        await ctx.db.delete(args.columnId);
    },
});

export const getColumnTasks = query({
    args: { columnId: v.id("kanbanColumns") },
    handler: async (ctx, args) => {
        const column = await ctx.db.get(args.columnId);
        if (!column) return null;

        const tasks = await ctx.db
            .query("kanbanTasks")
            .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
            .collect();

        tasks.sort((a, b) => a.order - b.order);

        return { ...column, tasks };
    },
});

// ============================================================
// TASK OPERATIONS
// ============================================================

export const createTask = mutation({
    args: {
        columnId: v.id("kanbanColumns"),
        title: v.string(),
        description: v.optional(v.string()),
        priority: v.optional(v.string()),
        aiGenerated: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const tasks = await ctx.db
            .query("kanbanTasks")
            .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
            .collect();

        const maxOrder = tasks.length > 0
            ? Math.max(...tasks.map(t => t.order))
            : -1;

        return await ctx.db.insert("kanbanTasks", {
            columnId: args.columnId,
            title: args.title,
            description: args.description,
            priority: args.priority ?? "medium",
            order: maxOrder + 1,
            aiGenerated: args.aiGenerated,
        });
    },
});

export const updateTask = mutation({
    args: {
        taskId: v.id("kanbanTasks"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        priority: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { taskId, ...updates } = args;
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );
        await ctx.db.patch(taskId, filteredUpdates);
    },
});

export const deleteTask = mutation({
    args: { taskId: v.id("kanbanTasks") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.taskId);
    },
});

export const moveTask = mutation({
    args: {
        taskId: v.id("kanbanTasks"),
        targetColumnId: v.id("kanbanColumns"),
        newOrder: v.number(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");

        const oldColumnId = task.columnId;
        const isMovingColumns = oldColumnId !== args.targetColumnId;

        // Get tasks in the target column
        const targetTasks = await ctx.db
            .query("kanbanTasks")
            .withIndex("by_column", (q) => q.eq("columnId", args.targetColumnId))
            .collect();

        // Filter out the moving task if it's in the same column
        const otherTasks = targetTasks.filter(t => t._id !== args.taskId);

        // Sort by order
        otherTasks.sort((a, b) => a.order - b.order);

        // Reorder tasks
        let order = 0;
        for (let i = 0; i <= otherTasks.length; i++) {
            if (i === args.newOrder) {
                await ctx.db.patch(args.taskId, {
                    columnId: args.targetColumnId,
                    order: order,
                });
                order++;
            }
            if (i < otherTasks.length) {
                await ctx.db.patch(otherTasks[i]._id, { order });
                order++;
            }
        }

        // If we haven't placed the task yet (newOrder >= otherTasks.length)
        if (args.newOrder >= otherTasks.length) {
            await ctx.db.patch(args.taskId, {
                columnId: args.targetColumnId,
                order: otherTasks.length,
            });
        }
    },
});

// Bulk create tasks (for AI generation)
export const createTasksBulk = mutation({
    args: {
        columnId: v.id("kanbanColumns"),
        tasks: v.array(v.object({
            title: v.string(),
            description: v.optional(v.string()),
            priority: v.optional(v.string()),
            url: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
            suggestedHeadings: v.optional(v.array(v.string())),
        })),

    },
    handler: async (ctx, args) => {
        const existingTasks = await ctx.db
            .query("kanbanTasks")
            .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
            .collect();

        let order = existingTasks.length > 0
            ? Math.max(...existingTasks.map(t => t.order)) + 1
            : 0;

        const createdIds = [];
        for (const task of args.tasks) {
            const id = await ctx.db.insert("kanbanTasks", {
                columnId: args.columnId,
                title: task.title,
                description: task.description,
                priority: task.priority ?? "medium",
                order: order++,
                aiGenerated: true,
                url: task.url,
                tags: task.tags,
                suggestedHeadings: task.suggestedHeadings,
            });
            createdIds.push(id);
        }

        return createdIds;
    },
});
