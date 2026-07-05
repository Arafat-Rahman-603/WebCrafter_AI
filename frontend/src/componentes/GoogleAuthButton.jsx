"use client";

import { useEffect, useRef, useState } from "react";

const BUTTON_TEXT_MAP = {
  signin_with: "signin_with",
  signup_with: "signup_with",
  continue_with: "continue_with",
};

export default function GoogleAuthButton({
  onCredential,
  text = "continue_with",
}) {
  const buttonRef = useRef(null);
  const initializedRef = useRef(false);
  const [error, setError] = useState("");

 
  const onCredentialRef = useRef(onCredential);
  
  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    let intervalId;

    const mountGoogleButton = () => {
     
      if (initializedRef.current || !buttonRef.current) {
        return true;
      }

      const google = window.google;
      if (!google?.accounts?.id) {
        return false;
      }

      google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (credential && typeof onCredentialRef.current === "function") {
            onCredentialRef.current(credential);
          }
        },
      });

     
      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }

      google.accounts.id.renderButton(buttonRef.current, {
       
        theme: "filled_blue", 
        size: "large",
        type: "standard",
        shape: "pill",
        text: BUTTON_TEXT_MAP[text] || "continue_with",
        width: 280,
        locale: "en",
      });

      initializedRef.current = true;
      setError("");
      return true;
    };

    
    if (!mountGoogleButton()) {
      intervalId = window.setInterval(() => {
        if (mountGoogleButton()) {
          window.clearInterval(intervalId);
        }
      }, 250);
    }

   
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    
      initializedRef.current = false;
    };
  }, [text]); 

  if (error) {
    return (
      <button
        type="button"
        disabled
        className="w-full max-w-[280px] rounded-full border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
      >
        {error}
      </button>
    );
  }

  return (
    <div 
      ref={buttonRef} 
      className="min-h-[44px] flex items-center justify-center transition-opacity duration-200" 
    />
  );
}
