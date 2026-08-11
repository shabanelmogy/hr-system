namespace HrManagementSystem.Application.Common.Consts;

/// <summary>
/// ��� �������� ���� ���� ��������
/// </summary>
public enum KanbanBoardRole
{
    Owner = 1,
    Admin = 2,
    Editor = 3,
    Viewer = 4
}

/// <summary>
/// ���� ������
/// </summary>
public enum TaskStatus
{
    Todo = 1,
    InProgress = 2,
    Review = 3,
    Done = 4
}

/// <summary>
/// ������ ������
/// </summary>
public enum TaskPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}