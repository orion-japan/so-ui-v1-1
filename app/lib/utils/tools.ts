// app/lib/utils/tools.ts

/**
 * 複数ファイル情報を整形して返す関数
 */
export function addFileInfos(files: File[]) {
    return files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
    }));
}

/**
 * エージェントソートを名前順に並び替える関数
 */
export function sortAgentSorts(agentSorts: { name?: string }[]) {
    return agentSorts.sort((a, b) => {
        const aName = a.name || '';
        const bName = b.name || '';
        return aName.localeCompare(bName);
    });
}
