const API_URL = import.meta.env.VITE_API_URL;

function LoginPage() {
  return (
    <button onClick={() => (window.location.href = `${API_URL}/auth/google`)}>
      Login with google
    </button>
  );
}

export default LoginPage;
