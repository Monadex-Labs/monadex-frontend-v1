import ListUpdater from '@/state/list/updater'
import MulticallUpdater from '@/state/multicall/updater'
export default function Updaters (): JSX.Element {
  return (
      <>
        <ListUpdater />
        <MulticallUpdater />
      </>
  )
}
