"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("LOCKED");
  const [isProcessing, setIsProcessing] = useState(false);

  const triggerFaceIDAndUnlock = async () => {
    setIsProcessing(true);
    setStatus("VERIFYING FACE ID...");

    try {
      // 1. DUMMY WEBAUTHN CHALLENGE TO TRIGGER APPLE FACE ID
      const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32), // Random challenge
        rp: { name: "Samit's Secure Server" },
        user: {
          id: new Uint8Array(16),
          name: "samit@iphone17",
          displayName: "Samit Singh",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: { 
            authenticatorAttachment: "platform", // Forces on-device biometric
            userVerification: "required"         //  THIS TRIGGERS FACE ID!
        },
        timeout: 60000,
      };

      // Yeh line iPhone ka Face ID camera open karegi
      await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions as any });

      // 2. FACE ID SUCCESS -> HIT FASTAPI SERVER
      setStatus("SIGNALING LAPTOP...");
      
      const response = await fetch("https://unlock-laptop-via-apple-face-id.onrender.com/api/trigger-unlock", {
        method: "POST",
      });
      
      const data = await response.json();

      if (data.status === "success") {
        setStatus("ACCESS GRANTED 🟢");
        // 30 second baad wapas lock state mein UI reset kar do
        setTimeout(() => setStatus("LOCKED"), 30000);
      } else {
        setStatus("SERVER DENIED 🔴");
      }

    } catch (error) {
      console.error(error);
      setStatus("FACE ID FAILED 🔴");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white font-mono p-4">
      <div className="max-w-md w-full border border-gray-800 bg-gray-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        
        <h1 className="text-xl text-gray-400 mb-8 tracking-widest text-center">SYSTEM OVERRIDE</h1>
        
        {/* Status Indicator */}
        <div className={`mb-10 text-2xl font-bold tracking-widest text-center ${status.includes('GRANTED') ? 'text-green-500' : status.includes('FAILED') ? 'text-red-500' : 'text-blue-500'}`}>
          {status}
        </div>

        {/* Big Unlock Button */}
        <button
          onClick={triggerFaceIDAndUnlock}
          disabled={isProcessing}
          className="relative group w-48 h-48 rounded-full border-4 border-gray-800 bg-gray-950 flex flex-col items-center justify-center hover:border-blue-500 transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] active:scale-95 disabled:opacity-50"
        >
          <svg className={`w-16 h-16 ${status.includes('GRANTED') ? 'text-green-500' : 'text-gray-500 group-hover:text-blue-500'} mb-2 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {status.includes('GRANTED') ? (
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /> // Unlocked icon
            ) : (
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> // Locked icon
            )}
          </svg>
          <span className="text-sm tracking-widest text-gray-500 group-hover:text-blue-500 transition-colors">TAP TO UNLOCK</span>
        </button>

        <p className="mt-12 text-xs text-gray-600 text-center">Protected by Apple Secure Enclave</p>
      </div>
    </div>
  );
}