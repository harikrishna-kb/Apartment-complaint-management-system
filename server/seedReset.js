// CLI helper to reset and seed testing state
import { resetState } from './apiHandler.js';

console.log('--- SocietyCMS Test Suite: Resetting Environment to Baseline ---');
const result = resetState();
console.log(`[OK] Reset complete!`);
console.log(`- Seed Users: ${result.usersCount} (1 Admin, 2 Technicians, 1 Resident)`);
console.log(`- Seed Complaints: ${result.complaintsCount} (1 Pending, 1 Assigned, 1 Resolved)`);
result.complaints.forEach((c) => {
  console.log(`  * [${c.status}] ${c.ticketId} - ${c.title}`);
});
console.log('Environment ready for automated test execution.');
