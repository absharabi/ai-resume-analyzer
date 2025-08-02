import { usePuterStore } from 'lib/puter'
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router';
export const meta = () => ([
    { title: 'Resumind | Auth' },
    { name: 'Authentication page for Resumind', content: 'Log into your account'}
])

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();
    
    useEffect(() => {
        if (auth.isAuthenticated) navigate(next || '/');
    }, [auth.isAuthenticated, next]);



  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover flex items-center justify-center min-h-screen">
        <div className="gradient-border shadow-lg">
            <section className='flex flex-col items-center gap-8 bg-white p-10 rounded-2xl'> 
                <div className='flex flex-col items-center gap-2 text-center'>
                    <h1 className='text-3xl font-bold text-center'>Welcome to Resumind</h1>
                    <h2 className='text-gray-600 text-center mt-2'>Log In to Continue Your Job Journey.</h2>
                </div>
                <div>
                    {isLoading ? (
                        <button className='auth-button animate-pulse'>
                            <p className='text-white'>Signing you in...</p>
                        </button>
                    ) : (
                        <>
                             {auth.isAuthenticated ? (
                                <button className='auth-button' onClick={() => auth.signOut()}>
                                    <p className='text-white'>Sign Out</p>
                                </button>
                            ) : (
                                <button className='auth-button' onClick={() => auth.signIn()}>
                                    <p className='text-white'>Sign In </p>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    </main>
  )
}

export default Auth