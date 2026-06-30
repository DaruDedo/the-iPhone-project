export function getTimeframeStartDate(timeframe: string | null): Date {
  const d = new Date();
  let days = 1;
  switch (timeframe) {
    case "24h": days = 1; break;
    case "2d": days = 2; break;
    case "3d": days = 3; break;
    case "5d": days = 5; break;
    case "10d": days = 10; break;
    case "15d": days = 15; break;
    case "1m": days = 30; break;
    case "2m": days = 60; break;
    case "3m": days = 90; break;
  }
  d.setDate(d.getDate() - days);
  return d;
}
