import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">Welcome Back</h2>
        <div className="space-y-4">
          <input type="email" placeholder="Email" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-white" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-white" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200">Sign In</button>
        </div>
        <p className="text-center text-gray-400 mt-4">Don't have an account? <Link to="/register" className="text-white hover:underline">Register</Link></p>
      </motion.form>
    </div>
  );
};

export default Login;
