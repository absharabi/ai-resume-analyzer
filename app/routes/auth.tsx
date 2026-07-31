import { usePuterStore } from '~/lib/puter'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router';
export const meta = () => ([
    { title: 'Resumind | Auth' },
    { name: 'Authentication page for Resumind', content: 'Log into your account'}
])

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // searchParams.get() decodes for us; only allow same-site paths so a crafted
    // ?next=https://evil.com cannot turn the login screen into an open redirect.
    const requestedNext = searchParams.get('next');
    const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
        ? requestedNext
        : '/';

    useEffect(() => {
        if (auth.isAuthenticated) navigate(next, { replace: true });
    }, [auth.isAuthenticated, next, navigate]);



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