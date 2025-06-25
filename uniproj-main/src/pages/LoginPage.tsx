import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, GraduationCap, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { useTranslation } from "react-i18next";

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);

      const role = localStorage.getItem("role") || "ALUMNI";
      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "EMPLOYER") navigate("/employer/dashboard");
      else navigate("/graduate/profile");
    } catch {
      setError(t("auth.loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
<div className="relative h-screen flex items-center justify-center bg-gradient-to-r from-primary-700 to-primary-900 px-4 sm:px-6">
  {/* Затемнённый фон как в HomePage */}
  <div
    className="absolute inset-0 opacity-20 z-0 scale-500 bg-no-repeat bg-top bg-cover"
    style={{
      backgroundImage:
        'url("https://ricet.kg/assets/front/img/pagebuilder/662a3a04cbfc6.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  />

  {/* Контент поверх */}
  <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8 text-white">
          <div className="inline-flex justify-center items-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary-300" />
          </div>
          <h1 className="text-3xl font-bold">{t("auth.loginTitle")}</h1>
          <p className="mt-2 text-gray-200">{t("auth.loginSubtitle")}</p>
        </div>

        <Card className="animate-slide-up backdrop-blur-sm bg-white/90 shadow-lg">
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("auth.username")}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="user123"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
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
                    {t("auth.loggingIn")}
                  </>
                ) : (
                  t("auth.loginButton")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t("auth.noAccountQuestion")}{" "}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  {t("auth.registerNow")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
