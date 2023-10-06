const {getUniqueWeekId, getWeekStart} = require('./src/date-str')

describe('getWeekStart', () => {
    it('should return the correct week start date', () => {
      const dateStr1 = '2023-10-04T00:00:00Z';
      const result1 = getWeekStart(dateStr1);
      expect(result1).toBe('2023-10-02');
  
      const dateStr2 = '2023-09-18T05:30:00Z';
      const result2 = getWeekStart(dateStr2);
      expect(result2).toBe('2023-09-18');

      const dateStr3 = '2023-01-01T05:30:00Z';
      const result3 = getWeekStart(dateStr3);
      expect(result3).toBe('2022-12-26');
    });
  });
  
  describe('getUniqueWeekId', () => {
    it('should return the correct unique week ID', () => {
      // Test case 1
      const dateStr1 = '2023-10-04T00:00:00Z'; 
      const result1 = getUniqueWeekId(dateStr1);
      expect(result1).toBe('2023-10-02-Week'); 
  
      // Test case 2
      const dateStr2 = '2023-09-18T05:30:00Z';
      const result2 = getUniqueWeekId(dateStr2);
      expect(result2).toBe('2023-09-18-Week'); 

      // Test case 3
      const dateStr3 = '2023-01-01T05:30:00Z';
      const result3 = getUniqueWeekId(dateStr3);
      expect(result3).toBe('2022-12-26-Week'); 
    });
  });