import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Briefcase,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { motion } from "framer-motion";

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    role: "ALUMNI",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password2) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(t("auth.registerError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 bg-gray-50 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("auth.register")}
          </h1>
          <p className="mt-2 text-gray-600">{t("auth.registerSubtitle")}</p>
        </div>

        <Card className="animate-slide-up">
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder={t("auth.firstName")}
                    required
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder={t("auth.lastName")}
                    required
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={t("auth.username")}
                  required
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("auth.email")}
                  required
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("auth.password")}
                  required
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  name="password2"
                  type="password"
                  value={formData.password2}
                  onChange={handleChange}
                  placeholder={t("auth.confirmPassword")}
                  required
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("auth.role")}
                </label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  {["ALUMNI", "EMPLOYER"].map((r) => (
                    <motion.button
                      key={r}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center justify-center px-4 py-3 border transition-colors rounded-md ${
                        formData.role === r
                          ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setFormData((p) => ({ ...p, role: r }))}
                    >
                      {r === "ALUMNI" ? (
                        <>
                          <GraduationCap className="h-5 w-5 mr-2" />
                          {t("auth.graduate")}
                        </>
                      ) : (
                        <>
                          <Briefcase className="h-5 w-5 mr-2" />
                          {t("auth.employer")}
                        </>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("auth.registering")}
                  </>
                ) : (
                  t("auth.register")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t("auth.haveAccount")}{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  {t("auth.login")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
