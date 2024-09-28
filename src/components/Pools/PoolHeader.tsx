import Link from 'next/link';
import SearchInput from './PoolSearch'

const PoolHeader: React.FC = () => {
  return (
    <div className='flex justify-between items-center'>
      <SearchInput />
      <Link href='pools/new' className='ml-4 px-4 py-2 border-2 border-primary rounded-md bg-primary text-white transition-colors'>
        Create New Position
      </Link>
    </div>
  )
}

export default PoolHeader
