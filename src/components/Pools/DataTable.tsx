'use client'
import React, { useState } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  CircularProgress
} from '@mui/material'
import { SortOrder, getComparator, stableSort } from './sort'

export interface HeadCell<T> {
  id: string
  label: React.ReactNode | string
  numeric: boolean
  sortDisabled?: boolean
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit' | undefined
  element?: React.ReactNode
  buttonCell?: boolean
  sortKey: (optionBalance: T) => string | number
}

export interface DataTableProps<T> {
  headCells: Array<HeadCell<T>>
  data: T[]
  renderRow: (
    item: T,
    index: number,
    page: number,
    rowsPerPage: number,
  ) => React.ReactNode
  toolbar?: React.ReactNode
  caption?: React.ReactNode
  defaultOrderBy?: T
  defaultOrder?: 'asc' | 'desc'
  loading?: boolean
  isSinglelineHeader?: boolean
  size?: number
  rowPerPage?: number
  sortUpIcon?: React.ReactNode
  sortDownIcon?: React.ReactNode
  emptyMesage?: string
  showEmptyRows: boolean
  showPagination: boolean
}

const DataTable: React.FC<DataTableProps<any>> = ({
  headCells,
  data,
  renderRow,
  toolbar,
  sortUpIcon,
  sortDownIcon,
  caption,
  defaultOrderBy = headCells[0],
  defaultOrder = 'asc',
  loading = false,
  isSinglelineHeader = false,
  size = 0,
  rowPerPage = 10,
  emptyMesage = 'No results.',
  showEmptyRows = true,
  showPagination
}) => {
  const [order, setOrder] = useState<SortOrder>(defaultOrder)
  const [orderBy, setOrderBy] = useState<HeadCell<any>>(defaultOrderBy)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(rowPerPage)
  const count = size || data.length

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: HeadCell<any>
  ): void => {
    const isAsc = orderBy.id === property.id && order === 'asc'
    setOrder(isAsc && !property.sortDisabled ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event: unknown, newPage: number): void => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage)
  return (
    <Box className='rounded-lg border border-primary/50 bg-bgColor'>
      {toolbar}

      <TableContainer>
        <Table
          aria-labelledby='tableTitle'
          size='medium'
          aria-label='enhanced table'
        >
          <TableHead>
            <TableRow
              className='bg-primary/40'
            >
              {headCells.map((headCell, index) => (
                <TableCell
                  className={headCell.buttonCell ? '' : 'border-none text-lg font-clash '}
                  key={`${headCell.id}_${index}`}
                  align={headCell.align}
                  padding='normal'
                  sortDirection={orderBy.id === headCell.id ? order : false}
                >
                  {headCell.element}
                  {sortUpIcon && sortDownIcon
                    ? (
                      <Box
                        className='flex items-center text-white font-clash gap-2'
                        style={{
                          whiteSpace: isSinglelineHeader ? 'nowrap' : 'initial'
                        }}
                        onClick={(event: any) =>
                          handleRequestSort(event, headCell)}
                      >
                        <Box
                          className={`headCellLabel${
                          orderBy.id === headCell.id
                            ? ' text-primary'
                            : ''
                        }`}
                        >
                          {headCell.label}
                        </Box>
                        {!headCell.sortDisabled && (
                          <Box>
                            {order === 'asc' && orderBy.id === headCell.id
                              ? sortUpIcon
                              : sortDownIcon}
                          </Box>
                        )}
                      </Box>
                      )
                    : (
                      <TableSortLabel
                        style={{
                          whiteSpace: isSinglelineHeader ? 'nowrap' : 'initial'
                        }}
                        active={orderBy.id === headCell.id}
                        direction={orderBy.id === headCell.id ? order : 'asc'}
                        onClick={(event: any) =>
                          handleRequestSort(event, headCell)}
                      >
                        {headCell.label}
                        {orderBy.id === headCell.id
                          ? (
                            <span className='border border-red-300'>
                              {order === 'desc'
                                ? 'text-red-300'
                                : ''}
                            </span>
                            )
                          : null}
                      </TableSortLabel>
                      )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={headCells.length}>
                  <Box className='flex justify-center items-center'>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {stableSort(data, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item:any, index:number) => renderRow(item, index, page, rowsPerPage))
            }

            {!loading && data.length < 1 && (
              <TableRow style={{ height: 53 }}>
                <TableCell colSpan={headCells.length} align='center'>
                  {emptyMesage}
                </TableCell>
              </TableRow>
            )}

            {!loading && emptyRows > 0 && showEmptyRows && (
              <TableRow
                style={{
                  height: 53 * (data.length < 1 ? emptyRows - 1 : emptyRows)
                }}
              >
                <TableCell colSpan={headCells.length} />
              </TableRow>
            )}
          </TableBody>

          {caption === false && (
            <span style={{ marginTop: 24 }}>{caption}</span>
          )}
        </Table>
      </TableContainer>

      {showPagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          className='text-white/60'
          component='div'
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  )
}

export default DataTable
