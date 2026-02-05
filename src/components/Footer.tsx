import { Leaf } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-slate-900 rounded-sm flex items-center justify-center">
                                <Leaf className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-slate-900">Habitat</span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-sm">
                            Empowering global restoration through AI-driven insights.
                            Analyze specific sites and discover the best native species for sustainable ecosystems.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4 uppercase text-xs tracking-wider">Product</h3>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><a href="/analysis" className="hover:text-blue-700 transition-colors">Site Analysis</a></li>
                            <li><a href="/dashboard" className="hover:text-blue-700 transition-colors">Project Dashboard</a></li>
                            <li><a href="#" className="hover:text-blue-700 transition-colors">API Access</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4 uppercase text-xs tracking-wider">Company</h3>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-blue-700 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-blue-700 transition-colors">Impact</a></li>
                            <li><a href="#" className="hover:text-blue-700 transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Habitat Restoration AI. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
