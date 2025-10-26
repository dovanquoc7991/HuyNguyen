import { Card, CardContent } from "@/assets/ui/card";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function FeatureComingSoon() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md shadow-xl rounded-2xl border border-gray-200">
          <CardContent className="pt-8 pb-6 px-6">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <AlertCircle className="h-10 w-10 text-yellow-500" />
              </motion.div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Feature Coming Soon
              </h1>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Thanks for your interest! This feature is currently under development
              and will be available in an upcoming release. Please check back again soon.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
