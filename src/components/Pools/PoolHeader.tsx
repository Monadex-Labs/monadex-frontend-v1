import Link from 'next/link';

const PoolHeader: React.FC = () => {
  
  return (
    <div className="flex justify-between items-center">
      <Link href="pools/new" className="ml-4 px-4 py-2 text-primary border-2 border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
        Create New Position
      </Link>
    </div>
  );
};

export default PoolHeader;