import React, { ReactElement } from 'react'
import { Box, useMediaQuery, TableRow, TableCell, useTheme } from '@mui/material'
import { HiArrowDown, HiArrowUp } from 'react-icons/hi2'
import CustomTableMobile from './CustomTableMobile'
import DataTable from './DataTable'
import { useRouter } from 'next/navigation'

export interface CustomTableProps<T> {
  emptyMessage?: string
  showPagination?: boolean
  rowsPerPage?: number
  headCells: any
  data: any
  defaultOrderBy?: T
  defaultOrder?: 'asc' | 'desc'
  mobileHTML: (item: any, index: number) => ReactElement
  desktopHTML: (
    item: any,
    index: number,
    page: number,
    rowsPerPage: number,
  ) => any
}

const CustomTable: React.FC<CustomTableProps<any>> = ({
  rowsPerPage = 5,
  showPagination = true,
  emptyMessage,
  headCells,
  data,
  defaultOrderBy,
  defaultOrder,
  mobileHTML,
  desktopHTML
}) => {
  const theme = useTheme()
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('xs'))
  return (
    <Box>
      {mobileWindowSize
        ? (
          // @todo:style for mobile
          <CustomTableMobile data={data} mobileHTML={mobileHTML} />
          )
        : (
          <DataTable
            defaultOrderBy={defaultOrderBy}
            defaultOrder={defaultOrder}
            emptyMesage={emptyMessage}
            showPagination={showPagination}
            headCells={headCells}
            data={data}
            rowPerPage={rowsPerPage}
            sortUpIcon={<HiArrowUp />}
            sortDownIcon={<HiArrowDown />}
            showEmptyRows={false}
            renderRow={(item: any, index: any, page: any, rowsPerPage: any) => {
              return (
                <TableRow key={index}
                >
                  {desktopHTML(item, index, page, rowsPerPage).map(
                    (cellItem: any, ind: number) => (
                      <TableCell
                        key={ind}
                        className={cellItem.button ? '' : 'border-primary border-opacity-20'}
                      >
                        {cellItem.html}
                      </TableCell>
                    )
                  )}
                </TableRow>
              )
            }}
          />
          )}
    </Box>
  )
}

export default CustomTable
