import { Component, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
export class ErrorBoundary extends Component<{children?:ReactNode},{failed:boolean}> {
 state={failed:false}; static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<main className="mx-auto max-w-5xl px-6 py-20"><h1 className="font-mono text-3xl">Something went wrong</h1><button className="mt-4 underline" onClick={()=>location.reload()}>Reload page</button></main>:this.props.children??<Outlet/>;}
}
