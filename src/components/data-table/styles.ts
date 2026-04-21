import { cva } from 'class-variance-authority'

export const tableVariants = cva(
  'w-full caption-bottom text-sm',
  {
    variants: {
      size: {
        default: '[&_td]:p-3 [&_th]:p-3',
        middle: '[&_td]:p-2.5 [&_th]:p-2.5',
        small: '[&_td]:p-2 [&_th]:p-2 text-xs',
        mini: '[&_td]:p-1 [&_th]:p-1 text-[11px]',
      },
      stripe: {
        true: '[&_tbody_tr:nth-child(even)]:bg-muted/30',
        false: '',
      },
      hover: {
        true: '[&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/50',
        false: '',
      },
      border: {
        true: 'border',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      stripe: false,
      hover: true,
      border: false,
    },
  }
)

export const cellVariants = cva(
  'align-middle whitespace-nowrap',
  {
    variants: {
      border: {
        true: 'border-r last:border-r-0',
        false: '',
      },
    },
    defaultVariants: {
      border: false,
    },
  }
)

export const headerVariants = cva(
  'align-middle font-medium whitespace-nowrap text-foreground',
  {
    variants: {
      border: {
        true: 'border-r last:border-r-0',
        false: '',
      },
    },
    defaultVariants: {
      border: false,
    },
  }
)
