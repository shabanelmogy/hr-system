'use client';

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Computer as ComputerIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export interface EntityChangeLogEntry {
  id?: string | number;
  changeLogId: string | number;
  entityName?: string;
  key: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  changedAt: string;
  changedByPc?: string;
}

export interface EntityChangeLogDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  entityName?: string;
  entityCode?: string;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  logs?: EntityChangeLogEntry[];
}

interface GroupedChangeLog {
  changeLogId: string | number;
  changedBy: string;
  changedAt: string;
  changedByPc?: string;
  items: EntityChangeLogEntry[];
}

export function EntityChangeLogDialog({
  open,
  onClose,
  title,
  subtitle,
  entityName,
  entityCode,
  loading: isLoading = false,
  error,
  onRetry,
  logs,
}: EntityChangeLogDialogProps) {
  const { t, i18n } = useTranslation();
  const isAr = (i18n.resolvedLanguage ?? i18n.language).startsWith('ar');


  // Group log items by changeLogId or timestamp
  const groupedLogs = useMemo<GroupedChangeLog[]>(() => {
    if (!logs || logs.length === 0) return [];

    const map = new Map<string, GroupedChangeLog>();

    for (const log of logs) {
      const groupKey = String(log.changeLogId || log.changedAt);
      if (!map.has(groupKey)) {
        map.set(groupKey, {
          changeLogId: log.changeLogId,
          changedBy: log.changedBy || (isAr ? 'النظام' : 'System'),
          changedAt: log.changedAt,
          changedByPc: log.changedByPc,
          items: [],
        });
      }
      map.get(groupKey)!.items.push(log);
    }

    return Array.from(map.values());
  }, [logs, isAr]);

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const formatKeyName = (key: string) => {
    const translationKey = 'organizationalStructure.' + key.charAt(0).toLowerCase() + key.slice(1);
    const translated = t(translationKey);
    if (translated && translated !== translationKey) return translated;
    return key;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="change-log-dialog-title"
    >
      <DialogTitle
        id="change-log-dialog-title"
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <HistoryIcon color="primary" />
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              {title || (isAr ? 'سجل التعديلات والتدقيق' : 'Change History & Audit Trail')}
            </Typography>
            {(subtitle || entityCode || entityName) && (
              <Typography variant="caption" color="text.secondary">
                {subtitle || `${entityCode ? '[' + entityCode + '] ' : ''}${entityName || ''}`}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 2.5, minHeight: 280 }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 2,
            }}
          >
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary">
              {isAr ? 'جاري تحميل سجل التعديلات...' : 'Loading change history...'}
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {isAr ? 'حدث خطأ أثناء تحميل السجل' : 'Failed to load change history'}
            </Typography>
            {onRetry && (
              <Button variant="outlined" size="small" onClick={() => onRetry()}>
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            )}
          </Box>
        ) : groupedLogs.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 1.5,
            }}
          >
            <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {isAr ? 'لا توجد حركات تعديل سابقة' : 'No recorded changes found'}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {isAr
                ? 'لم يتم تسجيل أي تعديل على هذا العنصر حتى الآن'
                : 'No modifications have been recorded for this item yet'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {groupedLogs.map((group, index) => (
              <Paper
                key={group.changeLogId || index}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: 'divider',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
                }}
              >
                {/* Header info */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {group.changedBy}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(group.changedAt)}
                      </Typography>
                    </Box>

                    {group.changedByPc ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ComputerIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="caption" color="text.secondary">
                          {group.changedByPc}
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>
                </Box>

                {/* Diff Table */}
                <Table size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem' } }}>
                      <TableCell>{isAr ? 'الحقل' : 'Field'}</TableCell>
                      <TableCell>{isAr ? 'القيمة السابقة' : 'Old Value'}</TableCell>
                      <TableCell align="center" sx={{ width: 40 }}>
                        <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      </TableCell>
                      <TableCell>{isAr ? 'القيمة الجديدة' : 'New Value'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((item, i) => (
                      <TableRow key={item.id || i} hover>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', minWidth: 120 }}>
                          {formatKeyName(item.key)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'error.main' }}>
                          {item.oldValue ? (
                            <Chip
                              label={item.oldValue}
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ textDecoration: 'line-through', fontSize: '0.75rem' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              {isAr ? 'فارغ' : 'Empty'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <ArrowForwardIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'success.main' }}>
                          {item.newValue ? (
                            <Chip
                              label={item.newValue}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              {isAr ? 'فارغ' : 'Empty'}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          {isAr ? 'إغلاق' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EntityChangeLogDialog;
