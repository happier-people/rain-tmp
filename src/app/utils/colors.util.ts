export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export class Colors {
  private static componentToHex = (c: number): string => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  static colorWithOpacity = (hexString: string, opacity: number): number => {
    const parsed = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString);
    if (!parsed) {
      return 0;
    }

    const rgbValue: RGBColor = {
      r: parseInt(parsed[1], 16),
      g: parseInt(parsed[2], 16),
      b: parseInt(parsed[3], 16),
    };
    const rgbWithOpacity: RGBColor = {
      r: 255 - opacity * (255 - rgbValue.r),
      g: 255 - opacity * (255 - rgbValue.g),
      b: 255 - opacity * (255 - rgbValue.b),
    };

    return parseInt(
      Colors.componentToHex(rgbWithOpacity.r) +
        Colors.componentToHex(rgbWithOpacity.g) +
        Colors.componentToHex(rgbWithOpacity.b),
      16
    );
  };
}
