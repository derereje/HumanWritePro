"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Copy, Key, Trash2, Eye, EyeOff, Plus, AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  createdAt: string;
  isActive: boolean;
}

interface ApiKeysClientProps {
  hasApiAccess: boolean;
}

export default function ApiKeysClient({ hasApiAccess }: ApiKeysClientProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (hasApiAccess) {
      fetchApiKeys();
    } else {
      setLoading(false);
    }

  }, [hasApiAccess]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys");
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys([...apiKeys, data.apiKey]);
        setNewKeyName("");
        toast.success("API key created successfully");

        // Auto-copy the new key
        await navigator.clipboard.writeText(data.apiKey.key);
        toast.success("API key copied to clipboard");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create API key");
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys?id=${keyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter(k => k.id !== keyId));
        toast.success("API key deleted successfully");
      } else {
        toast.error("Failed to delete API key");
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
    }
  };

  const copyApiKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskApiKey = (key: string) => {
    return `${key.slice(0, 12)}${"•".repeat(20)}${key.slice(-4)}`;
  };

  if (!hasApiAccess) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            API Access
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Integrate HumanWritePro into your applications
          </p>
        </div>

        <Card className="border-orange-500/20 bg-orange-500/10 shadow-xl shadow-black/50 shadow-black/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <AlertCircle className="h-5 w-5" />
              API Access Requires ULTRA Plan
            </CardTitle>
            <CardDescription className="text-orange-400/80">
              Upgrade to the ULTRA plan to access our API and integrate the AI humanizer into your own applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-card p-4">
              <h3 className="font-semibold text-white mb-2">With API access, you can:</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Integrate AI humanization into your own applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Automate content humanization workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Process content at scale with programmatic access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Build custom integrations with your existing tools</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Link href="/pricing">
                <Button className="bg-blue-600 hover:bg-blue-700" data-analytics-id="api-keys-no-access-view-pricing">
                  View Pricing Plans
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" data-analytics-id="api-keys-no-access-contact-sales">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          API Keys
        </h1>
        <p className="mt-2 text-lg text-slate-400">
          Manage your API keys for integrating HumanWritePro into your applications
        </p>
      </div>

      {/* Create New API Key */}
      <Card className="mb-8 border-white/10 bg-white/[0.03] shadow-xl shadow-black/50 shadow-black/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Create New API Key
          </CardTitle>
          <CardDescription>
            Generate a new API key to access the HumanWritePro API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="keyName" className="sr-only">API Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g., Production Server, Testing Environment"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createApiKey()}
              />
            </div>
            <Button
              onClick={createApiKey}
              disabled={creating || !newKeyName.trim()}
              data-analytics-id="api-keys-create-button"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {creating ? "Creating..." : "Create Key"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Give your API key a descriptive name to help you remember what it's used for.
          </p>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Card className="border-white/10 bg-white/[0.03] shadow-xl shadow-black/50 shadow-black/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            Your API Keys
          </CardTitle>
          <CardDescription>
            {apiKeys.length === 0 ? "No API keys created yet" : `You have ${apiKeys.length} API key${apiKeys.length !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-slate-400 py-8">Loading...</p>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">No API keys yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-4 transition hover:shadow-xl shadow-black/50 shadow-black/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{apiKey.name}</h3>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="flex-1 rounded bg-card px-3 py-2 text-sm font-mono text-slate-300 border border-white/10">
                          {showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          data-analytics-id={`api-keys-toggle-visibility-${apiKey.id}`}
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyApiKey(apiKey.key)}
                          data-analytics-id={`api-keys-copy-${apiKey.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 flex gap-4 text-xs text-slate-400">
                        <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                        {apiKey.lastUsedAt && (
                          <span>Last used: {new Date(apiKey.lastUsedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => deleteApiKey(apiKey.id)}
                      data-analytics-id={`api-keys-delete-${apiKey.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card className="mt-8 border-white/10 bg-white/[0.03] shadow-xl shadow-black/50 shadow-black/50 backdrop-blur">
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to use the HumanWritePro API in your applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-2">Base URL</h3>
            <code className="block rounded bg-white/[0.04] px-3 py-2 text-sm">
              https://www.humanwritepro.com/api
            </code>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Authentication</h3>
            <p className="text-sm text-slate-400 mb-2">
              Include your API key in the request headers:
            </p>
            <code className="block rounded bg-white/[0.04] px-3 py-2 text-sm">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Example Request</h3>
            <pre className="rounded bg-white/[0.04] px-3 py-2 text-xs overflow-x-auto">
              {`curl -X POST https://www.humanwritepro.com/api/humanizer \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Your AI-generated text here",
    "preset": "professional"
  }'`}
            </pre>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support for API Documentation
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
