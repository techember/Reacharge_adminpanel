import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { PinInput } from "@/components/ui/pin-input";

export const Login = () => {
  const { loginWithToken } = useAuth(); // assumes login() sets user session

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [screen, setScreen] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Send OTP
  const handleSendOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      await fetch("https://api.new.techember.in/api/auth/user-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      setScreen("otp");
    } catch {
      setError("Failed to send OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP → Login
  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("https://api.new.techember.in/api/auth/user-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      if (!res.ok) throw new Error("Invalid OTP");

      const data = await res.json();
      // ✅ Call your existing login logic (phone-only session)
      await loginWithToken(data.token, data.user); 

      // Redirect to dashboard or refresh
      window.location.reload();
    } catch {
      setError("Invalid OTP. Try again.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  // STEP 1: ENTER PHONE NUMBER
  // ==============================
  if (screen === "phone") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="admin-card w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

          <label className="text-sm font-medium mb-2 block">Phone Number</label>
          <div className="relative">
            <UserIcon className="h-5 w-5 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full pl-10 pr-4 py-3 border rounded-lg bg-card"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>

          {error && <p className="text-destructive text-sm mt-3">{error}</p>}

          <button
            onClick={handleSendOtp}
            disabled={phone.length < 10 || isLoading}
            className="btn-primary w-full py-3 mt-6 disabled:opacity-50"
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      </div>
    );
  }

  // ==============================
  // STEP 2: ENTER OTP
  // ==============================
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="admin-card w-full max-w-md p-8 text-center">
        <LockClosedIcon className="h-8 w-8 mx-auto mb-4" />

        <h2 className="text-xl font-semibold mb-2">Enter OTP</h2>
        <p className="text-sm text-muted-foreground mb-6">
          OTP has been sent to <strong>{phone}</strong>
        </p>

        <PinInput length={6} type="number" className="gap-3" onChange={setOtp} />

        {error && <p className="text-destructive text-sm mt-4">{error}</p>}

        <button
          onClick={handleVerifyOtp}
          disabled={otp.length !== 6 || isLoading}
          className="btn-primary w-full mt-6"
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={handleSendOtp}
          className="text-primary text-sm mt-3 underline"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};
