"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import type { LoginFormValues } from "@/types/auth";

type UseLoginFormOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

const INITIAL_VALUES: LoginFormValues = {
  studentId: "",
  password: "",
};

export function useLoginForm(options: UseLoginFormOptions = {}) {
  const [form, setForm] = useState<LoginFormValues>(INITIAL_VALUES);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSubmitError(null);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: form.studentId.trim(),
          password: form.password,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        const message = data?.message || "เข้าสู่ระบบไม่สำเร็จ";
        setSubmitError(message);
        options.onError?.(message);
        return;
      }

      setForm((prev) => ({ ...prev, password: "" }));
      setSubmitSuccess(true);
      options.onSuccess?.();
    } catch {
      const message = "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่";
      setSubmitError(message);
      options.onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const clearSubmitError = () => {
    setSubmitError(null);
  };

  return {
    form,
    showPassword,
    isSubmitting,
    submitError,
    submitSuccess,
    handleInputChange,
    handleSubmit,
    togglePassword,
    clearSubmitError,
  };
}