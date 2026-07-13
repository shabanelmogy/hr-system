import { styled } from '@mui/material/styles';
import { Drawer } from '@mui/material';

export const SidebarDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 350,
    backgroundColor: theme.palette.background.paper,
    borderLeft: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[8],
    overflow: 'hidden',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
}));
