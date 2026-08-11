import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import type { SocialLoginHandler } from "../types";
import GoogleLoginButton from "./GoogleLoginButton";

type GoogleSocialLoginControlProps = {
  handleSocialLogin: SocialLoginHandler;
  isDarkMode: boolean;
  disabled: boolean;
};

export default function GoogleSocialLoginControl(props: GoogleSocialLoginControlProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
      <GoogleLoginAction {...props} />
    </GoogleOAuthProvider>
  );
}

function GoogleLoginAction({
  handleSocialLogin,
  isDarkMode,
  disabled,
}: GoogleSocialLoginControlProps) {
  const googleLogin = useGoogleLogin({
    onSuccess: (credentialResponse) => {
      void handleSocialLogin("google", credentialResponse);
    },
    onError: () => undefined,
  });

  return (
    <GoogleLoginButton
      isDarkMode={isDarkMode}
      disabled={disabled}
      onClick={() => googleLogin()}
    />
  );
}
