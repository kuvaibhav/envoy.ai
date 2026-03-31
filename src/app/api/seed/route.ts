import { NextResponse } from "next/server";
import {
  setProfile,
  setResume,
  setCustomPrompt,
  setUserDocument,
} from "@/lib/firebase/firestore";

const RESUME_TEXT = `Kumar Vaibhav
Location: 17645 NE 69th CT, Redmond, WA 98052
Phone: +1 (949) 419-5633
Email: kumar.vaibhav002@gmail.com
LinkedIn: kumarvaibhav002

SUMMARY
- 7+ years of experience building scalable systems, distributed services, APIs, and data platforms.
- Led cross-tech projects from schema design to observability, automation, and clean abstractions and architectural patterns.
- Strong focus on clean architecture, developer velocity, and production-grade system reliability.

WORK EXPERIENCE

Salesforce, Inc — Bellevue, Washington
SOFTWARE ENGINEER (Feb 2022 – Present)

Project: Agentforce – AI-Driven Setup for Data Cloud Enrichments (Target: May 2026)
- Leading development of an Agentforce-powered setup agent for Related List and Copy Field Enrichments in Salesforce Data Cloud.
- Enabling the agent to interpret business intent and generate production-grade enrichment configurations across CRM and Unified DMOs.
- Designing identity-safe mappings using match rules and key qualifiers to ensure accurate customer-level relationships.
- Building the orchestration layer that converts natural-language requests into valid enrichment definitions.
- Expected to reduce misconfiguration and customer support incidents by 30–40% while accelerating customer onboarding.

Project: High Scale Objects – Unified Marketing Application (Winter 2025 GA)
- Led design and implementation of high throughput DML operations for Salesforce High Scale Database (HSDB).
- Enabled batch CRUD of 3M+ records with sub-100 ms median latency following OData 4.0 protocol.
- Drove cross functional error-contract overhaul — partnered with platform architects and HSDB team to catalogue failure scenarios into platform-level, standardized client-agnostic API codes thereby reducing "unknown failure" stats by 90%.
- Extended MockODataService backed on in-house SocketTumi to simulate full OData CRUD + $batch flows, raising test coverage to 95% and retiring brittle wire-format stubs.
- Led UMA-HSO observability: defined cross-layer logging/metrics (connectivity, query, DML), delivered gap analysis, flow diagrams, and a unified latency & success/fail taxonomy driving Winter GA.
- Containerized the HSDBR runtime into a Docker image to simplify local development for High Scale Runtime (owned by another team); eliminated complex setup steps and drove adoption across multiple teams.

Project: Data Cloud Enrichments – Copy Field Enrichment (Spring 2024 GA)
- Designed REST-style Copy-Field APIs (CRUD + activate / deactivate) that power both UI and internal integrations.
- Designed and built Lightning UI flows for both Copy Field Enrichment and Related List creation, delivering a seamless wizard-style interface now used weekly by hundreds of admins.
- Extended Copy-Field to support Accelerated DMOs (BYOL cache tables); unlocking a new data-lake use case.
- Implemented nightly multi-org CopyFieldScanner cron job to auto-disable enrichments when target objects/fields become inaccessible, reducing support cases per release.
- Built a UI mocking framework using IndexedDB to simulate design-time data for Copy Field and Related List flows, enabling fast local development without backend dependencies.
- Shipped Fully Qualified Key (FQK) support in Companion orgs via metadata migration and validation utilities — boosting Copy-Field adoption by 20%.
- Added sandbox-provisioning checks that surface mis-configured orgs up-front, reducing customer investigation cycles by 30%.

Project: Virtual Entity Framework (Internal Platform Feature)
- Innovated a goldfile based metadata upgrade validation for Near Core entities, avoiding 50% of upgrade issues pre-merge.
- Instrumented the Virtual Data Adapter with Argus (latency / error-rate), reducing on-call tickets by 25%.
- Enhanced the Data Api layer and added cache for data source connection requests.
- Prioritized security in service design; implemented PII redaction/tokenization in logs to align with data compliance and audit requirements.

Plauzzable, Inc — Seattle, Washington
TECHNOLOGY CONSULTANT (May 2022 – November 2022)
- Built a POC for webRTC peer-to-peer video/chatting Plauzzable app.
- Supervised offshore development, designed test plan and led QA for the Plauzzable web application.
- Worked with product to pitch product at Y Combinator Seattle Startups.

Deloitte Consulting India Pvt. Ltd — Bengaluru, India
TECHNOLOGY CONSULTANT (May 2017 – September 2020)
- Led UI development and deployment for a No-Code CRUD Application Generator; designed an Angular-based interface and deployed the app using AWS EC2, enabling seamless full-stack demos without complex local setup.
- Rectified and redesigned automated command runs, health and alarm checks on Cisco and Nokia routers for a bespoke network automation platform for a Tier 2 Telecom Service Provider thereby improving accuracy of tests by 20%.
- Designed a common transaction table to log activities of router devices across applications on a network automation platform which improved root cause analysis.
- Implemented a queuing logic for router allocation for incoming requests thereby optimizing the router utilization by 30%.

EDUCATION

University of California – Irvine, Irvine, California
MASTER IN COMPUTER SCIENCE, GPA: 4.00 (September 2020 – Dec 2021)

SRM Institute of Science & Technology, Chennai, India
B.TECH IN ELECTRONICS AND COMMUNICATION (August 2012 – May 2016)

SKILLS
Programming: Java, Python, JavaScript, C++/C, SQL, HTML5, CSS3
Libraries & Frameworks: Angular, Lightning UI, Grafana, Bazel, Spring, Docker, RabbitMQ, Bootstrap, Django, NoSQL, JUnit, OAuth 2.0, PyTorch
Others: Argus (Similar to Prometheus), MongoDB, Git, Unix, Cursor, ChatGPT, Google NotebookLM, CI/CD, Kafka, Jenkins, Jira

PROJECTS & AWARDS

Salesforce Marketing Cloud – Perf Monitoring (Intern, September 2021)
- Designed a generic database schema on PostgreSQL for storing performance metrics of internal Salesforce applications.
- Implemented batch processing to optimize publication of 1 million metrics data under 4 minutes from 3 hours.
- Built a source-agnostic Java-based ingestion pipeline using RabbitMQ to queue and publish tasks asynchronously.
- Practiced TDD (Test Driven Development) and used JUnit to maintain code coverage of 96%.
- Integrated the database with Tableau and created a dashboard to visualize performance trends of Salesforce applications.

Butterworth Product Development Competition 2021 Winner
PROJECT LEAD (May 2021)
- 3rd Prize winner worth $3500 in the annual Butterworth Product Development Competition 2021 for development and leading of Team Armory towards developing a cybersecurity learning and training platform called "Vital".

Design of Out-of-Order Floating-Point Unit (Author, January 2016)
- Implemented a fully pipelined single-precision Floating Point Unit on a Spartan 6 FPGA Chip.
- The investigation shows that the adder and multiplier modules can be clocked at over 300 MHz and the top-module at over 200 MHz. High operating frequencies were achieved by precomputing possible values in earlier pipelining stages.`;

export async function POST() {
  try {
    await setProfile({
      name: "Kumar Vaibhav",
      email: "kumar.vaibhav002@gmail.com",
      tagline:
        "Software Engineer building scalable systems, distributed services, and AI-powered experiences.",
      githubUrl: "https://github.com/kuvaibhav",
      linkedinUrl: "https://linkedin.com/in/kumarvaibhav002",
      personalDescription:
        "7+ years of experience building scalable systems, distributed services, APIs, and data platforms. Currently at Salesforce working on AI-driven setup agents for Data Cloud. Strong focus on clean architecture, developer velocity, and production-grade system reliability.",
    });

    await setResume("current", {
      fileName: "Kumar-Vaibhav-Resume-2026.pdf",
      textContent: RESUME_TEXT,
      fileSizeBytes: 46016,
    });

    const prompts = [
      { text: "What is Kumar's experience with Java?", icon: "Code", order: 0 },
      { text: "What has Kumar done as a Technical Consultant?", icon: "Briefcase", order: 1 },
      { text: "Tell me about Kumar's AI agent work at Salesforce", icon: "Sparkles", order: 2 },
      { text: "What's Kumar's education background?", icon: "GraduationCap", order: 3 },
      { text: "What projects has Kumar built?", icon: "Lightbulb", order: 4 },
    ];

    for (let i = 0; i < prompts.length; i++) {
      await setCustomPrompt(`prompt-${i}`, prompts[i]);
    }

    await setUserDocument("research_paper", {
      title: "Design of Out-of-Order Floating-Point Unit",
      textContent:
        "Implemented a fully pipelined single-precision Floating Point Unit on a Spartan 6 FPGA Chip. The adder and multiplier modules can be clocked at over 300 MHz and the top-module at over 200 MHz. High operating frequencies were achieved by precomputing possible values in earlier pipelining stages.",
    });

    return NextResponse.json({ success: true, message: "Data seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
