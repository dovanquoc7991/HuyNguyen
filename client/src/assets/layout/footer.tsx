import { Button } from "@/assets/ui/button";
import { COMPANY_NAME } from "../Constants";
import "../css/footer.css";

export default function Footer() {
  return (
   <footer className="fixed bottom-0 left-0 w-full z-40 bg-white border-t border-gray-200 shrink-0">
      <div className="px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-sm text-secondary">
              © 2025 {COMPANY_NAME}. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
