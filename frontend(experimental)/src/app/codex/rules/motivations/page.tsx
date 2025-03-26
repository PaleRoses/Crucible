// app/codex/rules/motivation/page.tsx
import dynamic from 'next/dynamic';
import { NextPage } from 'next';
import LeftSidebar from '../../../../components/navbars/LeftSideBar'; // Assuming this is the correct path

// Dynamically import the ItemNavigation component with SSR disabled

const MotivationPage: NextPage = () => {
  return (
    <div className="relative min-h-screen">
      <LeftSidebar />
      <main className="md:ml-64 p-8">
 
        <h1 className="text-3xl font-bold mt-8">Motivation</h1>
        {/* Add your motivation content components here */}
      </main>
    </div>
  );
};

export default MotivationPage;