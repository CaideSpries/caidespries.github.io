export interface Env {
	GEMINI_API_KEY: string;
}

// ---------------------------------------------------------------------------
// Rate limiting — simple in-memory store (resets on worker cold start)
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10;

interface RateLimitEntry {
	timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	let entry = rateLimitMap.get(ip);

	if (!entry) {
		entry = { timestamps: [] };
		rateLimitMap.set(ip, entry);
	}

	// Prune timestamps outside the window
	entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

	if (entry.timestamps.length >= RATE_LIMIT_MAX) {
		return true;
	}

	entry.timestamps.push(now);
	return false;
}

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = [
	"https://caidespriestersbach.co.za",
	"https://www.caidespriestersbach.co.za",
	"http://localhost:3000",
	"http://localhost:4321", // Astro dev server
	"http://127.0.0.1:3000",
	"http://127.0.0.1:4321",
];

function getCorsHeaders(request: Request): Record<string, string> {
	const origin = request.headers.get("Origin") || "";
	const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : "";

	return {
		"Access-Control-Allow-Origin": allowed,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Max-Age": "86400",
	};
}

// ---------------------------------------------------------------------------
// System prompt — portfolio context baked in
// ---------------------------------------------------------------------------

const SYSTEM_CONTEXT = `You are Caide Spriestersbach's portfolio assistant on his personal website. Answer questions about his experience, projects, skills, and education using ONLY the information provided below. Be concise, helpful, and professional. If asked about something not covered here, say so honestly — never fabricate information.

PROFILE:
Caide Spriestersbach — Electrical & Computer Engineer based in Cape Town.
BSc(Eng) Electrical & Computer Engineering from UCT (2020-2024), final-year aggregate 80%, all first-class passes.

CURRENT ROLE — Cainmani (Pty) Ltd (July 2025-Present):
Junior Engineer / Software Developer in renewable energy consulting.
Built: CainWind wind farm analysis platform, Solar Portfolio Analysis Platform (~20,000 lines Python), MS Project Dashboard (React 18, FastAPI, PostgreSQL), Centralised GIS Infrastructure (PostgreSQL 16, PostGIS 3.4), containerised AI dev environment, 13 engineering SOPs, production server infrastructure (Traefik, Keycloak SSO, PostgreSQL, CI/CD), Nextcloud VDR, CRM deployment, GitHub organisation setup.

PREVIOUS EXPERIENCE:
- Bushveld Energy (Nov-Dec 2023): Engineer in Training, 200 MW solar PV + BESS design
- CPUT Training (Nov 2022): Welding, CNC, metrology, pneumatics, robotics
- Hot Ink Printing (2018): Pre-university apprenticeship

VENTURES:
- DataFlow (2023-Present): Startup tackling exploitative mobile data pricing in SA. Server-based OpenVPN architecture, then Flutter Android app with on-device VPN monitoring. 14 GitHub repos.
- YouCook AI (2025-Present): AI-powered meal planning platform. React 18, Node.js/Express, Supabase PostgreSQL, OpenAI/Claude API integration.

UNIVERSITY PROJECTS (all at UCT):
1. TOPSIS Network Selection (Distinction) — Python simulation of TOPSIS algorithm for vertical handoff in heterogeneous wireless networks
2. MD5 vs MD6 Hashing (Distinction) — Multi-platform benchmarking across C++, Verilog FPGA, OpenCL GPU. 132x FPGA speedup.
3. Iridium Satellite Data Pipeline (Distinction) — End-to-end embedded pipeline on STM32 for Antarctic buoy. 15:1 LZSS compression, modified Blowfish encryption.
4. Hardware Online Filters (Distinction) — FIR/IIR/DFT filter comparison on ESP32-CAM. Proved IIR optimal for real-time.
5. Camera Trap System (Distinction) — Two-part wildlife monitor for Kruger. ESP32-CAM sensing unit + RPi base station with LAMP web server. 3D-printed weatherproof enclosures.
6. Plastic to Power (81%, First Class) — Final-year research on microwave-assisted plastic pyrolysis for hydrogen production. Custom RPi sensing module.

SKILLS:
Languages: Python, Dart, JavaScript/TypeScript, Kotlin, Java, C/C++, SQL, PowerShell, MATLAB
Mobile: Flutter, Android, Firebase
Web: FastAPI, React 18, Streamlit, Node.js, Express, Tailwind CSS
Data/GIS: PostgreSQL, PostGIS, SQLite, GDAL, QGIS, Pandas, NumPy, Supabase
DevOps: Docker, Hyper-V, OpenVPN, Linux, Git, GitHub Actions, CI/CD
Engineering: PySAM, TopFarm, PyWake, WindFarmer, AutoCAD, HOMER, PVCad/PVSyst, KiCad
AI/ML: OpenAI API, Claude API
Hardware: Raspberry Pi, STM32, ESP32, KiCad, Soldering & Welding

EDUCATION:
- UCT BSc(Eng) ECE (2020-2024): GPA 73.52%, final year 80.33%
- Bishops Diocesan College (2017-2019): NSC 83.14%, 5 distinctions
- Hilton College (2015-2016): A team rugby/football, cultural colours for Saxophone

INTERESTS: Sea-kayak fishing (WCKAC member), saxophone, hiking, nature & environment
VOLUNTEERING: IEEE GLOBECOM 2024 volunteer (5,000+ attendee telecoms conference)`;

// ---------------------------------------------------------------------------
// Gemini API call
// ---------------------------------------------------------------------------

interface ChatMessage {
	role: "user" | "model";
	content: string;
}

interface GeminiContent {
	role: "user" | "model";
	parts: { text: string }[];
}

async function callGemini(messages: ChatMessage[], apiKey: string): Promise<string> {
	// Build contents array: system context as first user message + model ack, then conversation
	const contents: GeminiContent[] = [
		{
			role: "user",
			parts: [{ text: SYSTEM_CONTEXT }],
		},
		{
			role: "model",
			parts: [{ text: "Understood. I am Caide's portfolio assistant. I will only answer based on the portfolio information provided and will be concise, helpful, and honest." }],
		},
	];

	for (const msg of messages) {
		contents.push({
			role: msg.role,
			parts: [{ text: msg.content }],
		});
	}

	const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contents,
			generationConfig: {
				temperature: 0.7,
				maxOutputTokens: 500,
			},
		}),
	});

	if (!res.ok) {
		const errBody = await res.text();
		throw new Error(`Gemini API error (${res.status}): ${errBody}`);
	}

	const data = (await res.json()) as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};

	const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) {
		throw new Error("No response text from Gemini API");
	}

	return text;
}

// ---------------------------------------------------------------------------
// Route: POST /chat
// ---------------------------------------------------------------------------

async function handleChat(
	request: Request,
	env: Env,
	corsHeaders: Record<string, string>,
): Promise<Response> {
	let body: { messages?: ChatMessage[] };
	try {
		body = (await request.json()) as { messages?: ChatMessage[] };
	} catch {
		return Response.json(
			{ error: "Invalid JSON body." },
			{ status: 400, headers: corsHeaders },
		);
	}

	if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
		return Response.json(
			{ error: 'Request body must include a non-empty "messages" array.' },
			{ status: 400, headers: corsHeaders },
		);
	}

	for (const msg of body.messages) {
		if (!msg.role || !msg.content || !["user", "model"].includes(msg.role)) {
			return Response.json(
				{ error: 'Each message must have a "role" (user|model) and "content" string.' },
				{ status: 400, headers: corsHeaders },
			);
		}
	}

	const MAX_MESSAGES = 20;
	const messages = body.messages.slice(-MAX_MESSAGES);

	try {
		const response = await callGemini(messages, env.GEMINI_API_KEY);
		return Response.json({ response }, { headers: corsHeaders });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("Gemini API call failed:", message);
		return Response.json(
			{ error: "Failed to generate response. Please try again." },
			{ status: 502, headers: corsHeaders },
		);
	}
}

// ---------------------------------------------------------------------------
// Request handler — path-based routing
// ---------------------------------------------------------------------------

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const corsHeaders = getCorsHeaders(request);

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		// Rate limiting by IP
		const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
		if (isRateLimited(clientIP)) {
			return Response.json(
				{ error: "Rate limit exceeded. Max 10 requests per minute." },
				{ status: 429, headers: corsHeaders },
			);
		}

		// POST / or POST /chat
		if (request.method === "POST") {
			return handleChat(request, env, corsHeaders);
		}

		return Response.json(
			{ error: "Not found." },
			{ status: 404, headers: corsHeaders },
		);
	},
} satisfies ExportedHandler<Env>;
