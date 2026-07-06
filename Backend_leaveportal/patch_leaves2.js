const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'leaves.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('getLeavesByEmployee')) {
  content += `\nexport const getLeavesByEmployee = async (req: any, res: any): Promise<void> => {\n    try {\n        const { employeeId } = req.params;\n        const leaves = await prisma.leave_requests.findMany({\n            where: { employee_id: String(employeeId) },\n            include: { employee: true },\n            orderBy: { created_at: 'desc' }\n        });\n        res.status(200).json(leaves);\n    } catch (error) {\n        res.status(500).json({ error: "Failed to fetch leaves." });\n    }\n};\n`;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added getLeavesByEmployee successfully!');
