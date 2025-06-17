// Centralized date filtering logic to avoid duplication
export class DateFilterUtils {
  static getCurrentWeekRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startDate: startOfWeek, endDate: endOfWeek };
  }

  static getCurrentMonthRange(): { month: number; year: number } {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  }

  static getLastMonthRange(): { month: number; year: number } {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    return {
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year
    };
  }

  static getThreeMonthsAgoDate(): Date {
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    return threeMonthsAgo;
  }

  static filterOrdersByDateRange(orders: any[], dateFilter: string): any[] {
    if (!dateFilter || dateFilter === 'all') {
      return orders;
    }

    return orders.filter(order => {
      const orderDate = new Date(order.weekStartDate);
      
      switch (dateFilter) {
        case "current-week": {
          const { startDate, endDate } = this.getCurrentWeekRange();
          return orderDate >= startDate && orderDate <= endDate;
        }
        case "current-month": {
          const { month, year } = this.getCurrentMonthRange();
          return orderDate.getMonth() === month && orderDate.getFullYear() === year;
        }
        case "last-month": {
          const { month, year } = this.getLastMonthRange();
          return orderDate.getMonth() === month && orderDate.getFullYear() === year;
        }
        case "last-3-months": {
          const threeMonthsAgo = this.getThreeMonthsAgoDate();
          return orderDate >= threeMonthsAgo;
        }
        default:
          return true;
      }
    });
  }

  static validateDateFilter(dateFilter: string): boolean {
    const validFilters = ['all', 'current-week', 'current-month', 'last-month', 'last-3-months'];
    return validFilters.includes(dateFilter);
  }
}