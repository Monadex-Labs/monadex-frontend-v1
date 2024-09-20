import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useToken } from '@/hooks/Tokens';
import useDebouncedChangeHandler from '@/utils/useDebouncedChangeHandler';

const PoolHeader: React.FC = () => {
  const handleInput = useCallback((input: string) => {
    // Remove the isAddress check as it's not necessary for this example
    setSearchQuery(input);
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchQueryInput, setSearchQueryInput] = useDebouncedChangeHandler(
    searchQuery,
    handleInput
  )
  const searchToken = useToken(searchQuery)


  return (
    <div className="flex justify-between items-center">
      <div className="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Search by token or pool name"
          value={searchQueryInput}
          onChange={(e) => setSearchQueryInput(e.target.value)}
          className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
        />
      </div>
      <Link href="pools/new" className="ml-4 px-4 py-2 text-primary border-2 border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
        Create New Position
      </Link>
    </div>
  );
};

export default PoolHeader;