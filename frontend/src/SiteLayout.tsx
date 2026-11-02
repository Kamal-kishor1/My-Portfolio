import { Outlet } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
export default function SiteLayout() { return <div className="site-root"><StatusBar/><SiteHeader/><div className="min-h-screen flex flex-col"><main className="flex-1"><Outlet/></main><SiteFooter/></div></div>; }
