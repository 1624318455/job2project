import { createHash } from 'crypto';

interface VercelDeploymentResult {
  url: string;
  alias?: string;
  id: string;
}

interface VercelFile {
  file: string;
  sha: string;
  size: number;
}

async function uploadFile(
  content: string,
  token: string
): Promise<{ sha: string; size: number }> {
  const sha = createHash('sha1').update(content).digest('hex');
  const size = Buffer.byteLength(content, 'utf8');

  const response = await fetch(`https://api.vercel.com/v2/files?teamId=${process.env.VERCEL_TEAM_ID || ''}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sha,
      size,
      content,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file: ${response.status} ${error}`);
  }

  return { sha, size };
}

export async function deployToVercel(
  files: Record<string, string>,
  token: string,
  projectName?: string
): Promise<VercelDeploymentResult> {
  console.log('[vercel] Uploading', Object.keys(files).length, 'files...');

  // Upload all files and collect SHA hashes
  const vercelFiles: Record<string, VercelFile> = {};
  for (const [path, content] of Object.entries(files)) {
    const { sha, size } = await uploadFile(content, token);
    vercelFiles[path] = { file: path, sha, size };
  }

  console.log('[vercel] Creating deployment...');

  // Create deployment
  const deploymentBody: Record<string, unknown> = {
    name: projectName || 'job2project-generated',
    files: Object.values(vercelFiles),
    projectSettings: {
      buildCommand: 'npm run build',
      devCommand: 'npm run dev',
      installCommand: 'npm install',
      outputDirectory: 'dist',
    },
    meta: {
      source: 'job2project',
    },
  };

  const response = await fetch(`https://api.vercel.com/v13/deployments?teamId=${process.env.VERCEL_TEAM_ID || ''}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deploymentBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create deployment: ${response.status} ${error}`);
  }

  const data = await response.json();

  return {
    url: `https://${data.url}`,
    alias: data.alias,
    id: data.uid,
  };
}
