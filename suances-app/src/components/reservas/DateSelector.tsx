import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface Props {
  fecha: string;
  onChangeFecha: (value: string) => void;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const parseFecha = (fecha: string): Date => {
  const [year, month, day] = fecha.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatFecha = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatFechaDisplay = (fecha: string): string => {
  const date = parseFecha(fecha);
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const DateSelector: React.FC<Props> = ({ fecha, onChangeFecha }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewDate, setViewDate] = useState(parseFecha(fecha));

  const currentDate = parseFecha(fecha);

  const goToPrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onChangeFecha(formatFecha(newDate));
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onChangeFecha(formatFecha(newDate));
  };

  const selectDay = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChangeFecha(formatFecha(newDate));
    setModalVisible(false);
  };

  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const isSelectedDay = (day: number) => {
    return viewDate.getFullYear() === currentDate.getFullYear() &&
           viewDate.getMonth() === currentDate.getMonth() &&
           day === currentDate.getDate();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return viewDate.getFullYear() === today.getFullYear() &&
           viewDate.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
    setViewDate(newDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity onPress={goToPrevDay} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => {
            setViewDate(currentDate);
            setModalVisible(true);
          }}
        >
          <Ionicons name="calendar" size={20} color={colors.accent} />
          <Text style={styles.dateText}>{formatFechaDisplay(fecha)}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <Text style={styles.navText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <Text style={styles.navText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {DAYS.map((day) => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {generateCalendarDays().map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    day && isSelectedDay(day) && styles.daySelected,
                    day && isToday(day) && styles.dayToday,
                  ]}
                  onPress={() => day && selectDay(day)}
                  disabled={!day}
                >
                  <Text style={[
                    styles.dayText,
                    day && isSelectedDay(day) && styles.dayTextSelected,
                    day && isToday(day) && styles.dayTextToday,
                  ]}>
                    {day || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    padding: spacing.sm,
  },
  navText: {
    ...typography.h2,
    color: colors.primary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  calendarIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  dateText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  monthTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.sm,
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayText: {
    ...typography.body,
    color: colors.text,
  },
  dayTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: '600',
  },
});
