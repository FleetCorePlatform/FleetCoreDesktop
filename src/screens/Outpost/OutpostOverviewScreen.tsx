import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiCall } from '@/utils/api.ts';
import { OutpostHeader } from './components/OutpostHeader';
import { OutpostStats } from './components/OutpostStats';
import { GroupList } from './components/GroupList';
import { CreateGroupDialog } from './components/CreateGroupDialog';
import { GroupSummary, OutpostSummary } from '@/screens/common/types.ts';
import { CreateGroupBody, GROUP_NAME_REGEX } from '@/screens/Outpost/types.ts';

export default function OutpostOverviewScreen() {
  const { outpostUuid } = useParams<{ outpostUuid: string }>();
  const [outpost, setOutpost] = useState<OutpostSummary | null>(null);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupNameError, setGroupNameError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const outpostOverview: OutpostSummary = await apiCall(
          `/api/v1/outposts/${outpostUuid}/summary`,
          undefined,
          'GET'
        );

        setOutpost(outpostOverview);
        setGroups(outpostOverview.groups);
      } catch (error) {
        console.error('Failed to fetch outpost details', error);
      } finally {
        setLoading(false);
      }
    };

    if (outpostUuid) {
      fetchData();
    }
  }, [outpostUuid]);

  const handleCreateGroup = async () => {
    if (!newGroupName) {
      setGroupNameError('Group name is required.');
      return;
    }
    if (!GROUP_NAME_REGEX.test(newGroupName)) {
      setGroupNameError("Invalid format. Use alphanumeric, '-', '_', or ':'. Max 128 chars.");
      return;
    }

    setIsCreating(true);
    setGroupNameError(null);

    const payload: CreateGroupBody = {
      outpost_uuid: outpost?.uuid || '',
      group_name: newGroupName,
    };

    await apiCall('/api/v1/groups', undefined, 'POST', payload)
      .then(() => {
        setIsDialogOpen(false);
        setNewGroupName('');
      })
      .catch((e) => {
        console.error('Failed to create group', e);
        setGroupNameError('Failed to create group. Please try again.');
      })
      .finally(() => {
        setIsCreating(false);
        navigate(0);
      });
  };

  const openDialog = () => {
    setNewGroupName('');
    setGroupNameError(null);
    setIsDialogOpen(true);
  };

  const filteredGroups = groups.filter((g) =>
    g.groupName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-[hsl(var(--text-secondary))]">
        Loading outpost details...
      </div>
    );
  }

  if (!outpost) {
    return (
      <div className="p-8 text-center text-[hsl(var(--text-secondary))]">Outpost not found.</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6">
          <OutpostHeader outpost={outpost} outpostUuid={outpostUuid} openDialog={openDialog} />

          <OutpostStats outpost={outpost} groups={groups} />

          <GroupList
            filteredGroups={filteredGroups}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            outpost={outpost}
            outpostUuid={outpostUuid}
          />
        </div>
      </div>

      <CreateGroupDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        outpost={outpost}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        groupNameError={groupNameError}
        setGroupNameError={setGroupNameError}
        isCreating={isCreating}
        handleCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
