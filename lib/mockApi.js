import mockData from '../data/mockData.json';

// Simulate async API calls â swap these with real fetch() calls when backend is ready
const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

export async function getPatients() {
  await delay();
  return [...mockData.patients].sort((a, b) => b.riskScore - a.riskScore);
}

export async function getPatientById(id) {
  await delay(150);
  return mockData.patients.find(p => p.id === id) || null;
}

export async function getAlerts() {
  await delay(200);
  return [...mockData.alerts];
}

export async function getKpiData() {
  await delay(100);
  return { ...mockData.kpiData };
}

export async function getWhatsappPreview() {
  await delay(100);
  return { ...mockData.whatsappPreview };
}

// Synchronous accessors for SSR / static use
export const getAllPatients = () => [...mockData.patients].sort((a, b) => b.riskScore - a.riskScore);
export const getAllAlerts = () => [...mockData.alerts];
export const getKpi = () => ({ ...mockData.kpiData });
export const getWhatsapp = () => ({ ...mockData.whatsappPreview });
