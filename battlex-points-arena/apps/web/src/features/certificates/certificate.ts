export function createCertificateId() {
  return `BX-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function printCertificate() {
  if (typeof window !== "undefined") window.print();
}
