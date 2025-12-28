export default class Utils {
  static async loadFile(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`無法讀取檔案: ${url} (狀態碼: ${response.status})`);
      }
      return await response.text();
    } catch (error) {
      console.error('讀取文字檔案失敗:', error);

      throw error;
    }
  }
}
