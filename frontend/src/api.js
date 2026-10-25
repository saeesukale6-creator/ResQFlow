
const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function getEmergencies() {
  const response = await fetch(`${API_URL}/emergencies`);

  if (!response.ok) {
    throw new Error('Could not load emergency reports.');
  }

  return response.json();
}

export async function getAmbulances() {
  const response = await fetch(`${API_URL}/ambulances`);

  if (!response.ok) {
    throw new Error('Could not load ambulance records.');
  }

  return response.json();
}

export async function assignAmbulance(reportId, ambulanceId) {
  const response = await fetch(`${API_URL}/assign-ambulance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      report_id: Number(reportId),
      ambulance_id: Number(ambulanceId),
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof result?.detail === 'string'
        ? result.detail
        : 'Could not assign the ambulance. Check the report and ambulance IDs.';
    throw new Error(message);
  }

  return result;
}

export async function getAssignments() {
  const response = await fetch(`${API_URL}/assignments`);

  if (!response.ok) {
    throw new Error('Could not load assignment history.');
  }

  return response.json();
}

export async function getDemandForecast(location, hour, dayOfWeek) {
  const params = new URLSearchParams({
    location,
    hour: String(hour),
    day_of_week: String(dayOfWeek),
  });

  const response = await fetch(
    `${API_URL}/predict-demand?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Unable to fetch the demand prediction.");
  }

  return response.json();
}
