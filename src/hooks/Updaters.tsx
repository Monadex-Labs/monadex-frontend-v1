'use client'
import ListUpdater from '@/state/list/updater'
import MulticallUpdater from '@/state/multicall/updater'
import ApplicationUpdater from '@/state/application/updater'
export default function Updaters (): JSX.Element {
  return (
    <>
      <ListUpdater />
      <MulticallUpdater />
      <ApplicationUpdater />
    </>
  )
}
