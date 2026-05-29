"use client";

import { useState } from "react";
import { Search, MoreVertical, Shield, Ban, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dummyUsers } from "@/lib/dummy-data";

const STAT_CARDS = [
  { label: "Total Users",     getValue: (u: any) => u.length,                       color: "text-primary",   bg: "bg-primary/8" },
  { label: "Renters",         getValue: (_: any, r: any) => r.length,                color: "text-secondary", bg: "bg-secondary/8" },
  { label: "Owners",          getValue: (_: any, __: any, o: any) => o.length,       color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Verified Owners", getValue: (_: any, __: any, o: any) => o.filter((x: any) => x.isVerified).length, color: "text-amber-600", bg: "bg-amber-50" },
];

export function UserMonitor() {
  const [query, setQuery] = useState("");

  const renters = dummyUsers.renters.map((u) => ({ ...u, roleLabel: "Renter" }));
  const owners  = dummyUsers.owners.map((u)  => ({ ...u, roleLabel: "Owner"  }));
  const allUsers = [...renters, ...owners];

  const filtered = allUsers.filter(
    (u) =>
      u.full_name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  const statValues = [
    allUsers.length,
    renters.length,
    owners.length,
    owners.filter((o: any) => o.isVerified).length,
  ];

  const UserRow = ({ user }: { user: any }) => (
    <div className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
          {user.full_name?.charAt(0) ?? "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{user.full_name}</p>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
      </div>

      <Badge
        className={
          user.roleLabel === "Owner"
            ? "bg-secondary/10 text-secondary border-secondary/20"
            : "bg-primary/10 text-primary border-primary/20"
        }
      >
        {user.roleLabel}
      </Badge>

      <Badge className="status-approved">Active</Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="gap-2">
            <Mail className="h-4 w-4" /> Send message
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Shield className="h-4 w-4" /> View details
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
            <Ban className="h-4 w-4" /> Suspend account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">User Monitor</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and monitor all platform users</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Total Users", "Renters", "Owners", "Verified Owners"].map((label, i) => (
          <Card key={label} className="card-hover border border-border shadow-none">
            <CardContent className="pt-5 pb-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold text-foreground mt-0.5">{statValues[i]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({allUsers.length})</TabsTrigger>
          <TabsTrigger value="renters">Renters ({renters.length})</TabsTrigger>
          <TabsTrigger value="owners">Owners ({owners.length})</TabsTrigger>
        </TabsList>

        {(["all", "renters", "owners"] as const).map((tab) => {
          const list =
            tab === "all"    ? filtered :
            tab === "renters"? filtered.filter((u) => u.roleLabel === "Renter") :
                               filtered.filter((u) => u.roleLabel === "Owner");
          return (
            <TabsContent key={tab} value={tab} className="mt-4">
              <Card className="border border-border shadow-none overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border px-4 py-2.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
                  <span className="w-8" />
                </div>
                <CardContent className="p-0">
                  {list.length > 0 ? (
                    list.map((user) => <UserRow key={user.id} user={user} />)
                  ) : (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                      No users found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}