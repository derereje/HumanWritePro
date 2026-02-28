"use client";

import { useEffect, useState } from "react";
import { useUser } from "~/lib/mockClerk";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Loader2, Users, Plus, Trash2, UserPlus, Crown, Shield } from "lucide-react";
import { toast } from "sonner";
import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface Team {
  id: string;
  name: string;
  ownerId: string;
  sharedCredits: number;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

interface TeamData {
  team: Team | null;
  ownedTeams: Team[];
  canCreateTeam: boolean;
  subscriptionPlan: string | null;
}

export default function TeamPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
      return;
    }

    if (isSignedIn) {
      fetchTeamData();
    }
  }, [isSignedIn, isLoaded, router]);

  const fetchTeamData = async () => {
    try {
      const response = await fetch("/api/team");
      if (response.ok) {
        const data = await response.json();
        setTeamData(data);
      } else {
        toast.error("Failed to load team data");
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team? You will lose access to shared credits.")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/team/leave", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Left team successfully!");
        await fetchTeamData();
        // Force a reload to update credits and subscription state across the app
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to leave team");
      }
    } catch (error) {
      console.error("Error leaving team:", error);
      toast.error("Failed to leave team");
    } finally {
      setActionLoading(false);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Team created successfully!");
        setNewTeamName("");
        setShowCreateForm(false);
        await fetchTeamData();
      } else {
        toast.error(data.error || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    } finally {
      setActionLoading(false);
    }
  };

  const addMember = async (teamId: string) => {
    if (!memberEmail.trim()) {
      toast.error("Please enter a member email");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/team/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, memberEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Member added successfully!");
        setMemberEmail("");
        setSelectedTeamId(null);
        await fetchTeamData();
      } else {
        toast.error(data.error || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setActionLoading(false);
    }
  };

  const removeMember = async (teamId: string, memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/team/members?teamId=${teamId}&memberId=${memberId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Member removed successfully!");
        await fetchTeamData();
      } else {
        toast.error(data.error || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/team?teamId=${teamId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Team deleted successfully!");
        await fetchTeamData();
      } else {
        toast.error(data.error || "Failed to delete team");
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <PageNavbar />

      <main className="flex-1 py-12 pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white">Team Management</h1>
            <p className="mt-2 text-slate-400">
              Manage your team members and collaborate on humanization projects.
            </p>
          </div>

          {!teamData?.canCreateTeam && (
            <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-300">Upgrade to Ultra Plan</h3>
                  <p className="mt-1 text-sm text-amber-400">
                    Team support is available exclusively for Ultra plan subscribers. Upgrade your plan to create and manage teams.
                  </p>
                  <Button
                    onClick={() => router.push("/pricing")}
                    data-analytics-id="team-upgrade-view-pricing"
                    className="mt-4 rounded-lg bg-amber-600 hover:bg-amber-700"
                  >
                    View Pricing
                  </Button>
                </div>
              </div>
            </div>
          )}

          {teamData?.team && (
            <div className="mb-8 rounded-xl border border-white/10 bg-card p-8 ">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Your Team</h2>
                  <p className="text-sm text-slate-400">Team: {teamData.team.name}</p>
                </div>
                {teamData.team.ownerId !== teamData.team.members.find(m => m.email === user?.primaryEmailAddress?.emailAddress)?.id && (
                  <Button
                    variant="outline"
                    onClick={leaveTeam}
                    disabled={actionLoading}
                    data-analytics-id="team-leave-button"
                    className="rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Leave Team"}
                  </Button>
                )}
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-300">Team Owner</h3>
                <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-white">{teamData.team.owner?.name}</p>
                      <p className="text-sm text-slate-400">{teamData.team.owner?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {teamData?.ownedTeams && teamData.ownedTeams.length > 0 && (
            <div className="space-y-6">
              {teamData.ownedTeams.map((team) => (
                <div key={team.id} className="rounded-xl border border-white/10 bg-card p-8 ">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{team.name}</h2>
                      <p className="text-sm text-slate-400">{team.members.length} members</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTeam(team.id)}
                      disabled={actionLoading}
                      data-analytics-id="team-delete-button"
                      className="rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-300">Team Members</h3>
                      <Button
                        size="sm"
                        onClick={() => setSelectedTeamId(selectedTeamId === team.id ? null : team.id)}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>

                    {selectedTeamId === team.id && (
                      <div className="mt-4 flex gap-2">
                        <input
                          type="email"
                          placeholder="Enter member email"
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                          className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <Button
                          onClick={() => addMember(team.id)}
                          disabled={actionLoading}
                          data-analytics-id="team-add-member-button"
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                        >
                          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                        </Button>
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      {team.members.length === 0 ? (
                        <p className="text-sm text-slate-400">No members yet. Add members to start collaborating.</p>
                      ) : (
                        team.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4"
                          >
                            <div className="flex items-center gap-3">
                              <Users className="h-5 w-5 text-slate-400" />
                              <div>
                                <p className="font-medium text-white">{member.name}</p>
                                <p className="text-sm text-slate-400">{member.email}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMember(team.id, member.id)}
                              disabled={actionLoading}
                              data-analytics-id="team-remove-member-button"
                              className="rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {teamData?.canCreateTeam && (
            <div className="mt-8">
              {!showCreateForm ? (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  data-analytics-id="team-create-new-button"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-5 w-5" /> Create New Team
                </Button>
              ) : (
                <div className="rounded-xl border border-white/10 bg-card p-8 ">
                  <h2 className="text-xl font-semibold text-white">Create New Team</h2>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Team Name</label>
                      <input
                        type="text"
                        placeholder="Enter team name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-white/10 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={createTeam}
                        disabled={actionLoading}
                        data-analytics-id="team-create-submit-button"
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Team"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewTeamName("");
                        }}
                        className="rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
