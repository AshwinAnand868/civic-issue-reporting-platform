import RegistrationForm from "./components/RegisterForm";

export default function RegistrationPage() {
  return (
   <div
      style={{
        backgroundImage: "url('/image/registration bg image.jpg')",
        backgroundSize: '100% 100%', 
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 50,
      }}
      className="px-2 sm:px-8" 
    >
      <div
        className="max-w-md w-full p-4 bg-black/65 backdrop-blur-md rounded-xl shadow-lg text-white"
        
      >
        <h2 className="text-3xl font-bold mb-6 text-blue-400">Welcome </h2>
        <RegistrationForm />
      </div>
    </div>
  );
}
