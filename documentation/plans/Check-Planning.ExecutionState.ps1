function Get-PlanningExecutionStateErrors {
    param(
        [Parameter(Mandatory)] [string] $PlanName,
        [Parameter(Mandatory)] [bool] $PlanIsClosed,
        [Parameter(Mandatory)] [AllowEmptyCollection()] [object[]] $Contracts,
        [Parameter(Mandatory)] [AllowEmptyCollection()] [string[]] $RoadmapMarkers
    )

    $result = New-Object System.Collections.Generic.List[string]
    if ($PlanIsClosed) {
        if ($RoadmapMarkers.Count -ne 1 -or $RoadmapMarkers[0] -cne 'None') {
            $result.Add("Closed business plan '$PlanName' must declare exactly one ACTIVE_FEATURE_STEP marker with the exact value 'None'")
        }

        $unfinished = @($Contracts | Where-Object { -not $_.IsClosed })
        if ($unfinished.Count -gt 0) {
            $result.Add("Closed business plan '$PlanName' must have every version 2.0 feature contract with Execution status Closed")
        }

        return @($result)
    }

    if ($RoadmapMarkers.Count -ne 1) {
        $result.Add("Business plan '$PlanName' with version 2.0 feature contracts must declare exactly one ACTIVE_FEATURE_STEP marker")
    }

    $activeContracts = @($Contracts | Where-Object { $_.IsActive })
    if ($activeContracts.Count -ne 1) {
        $result.Add("Business plan '$PlanName' must have exactly one version 2.0 feature contract with Execution status Active")
    } elseif ($RoadmapMarkers.Count -eq 1) {
        $roadmapFeatureId = $RoadmapMarkers[0].Trim([char]0x60)
        if ([string]::IsNullOrWhiteSpace($activeContracts[0].FeatureId) -or $activeContracts[0].FeatureId -ne $roadmapFeatureId) {
            $result.Add("Business plan '$PlanName' ACTIVE_FEATURE_STEP '$roadmapFeatureId' must match the Active version 2.0 contract Child Feature ID '$($activeContracts[0].FeatureId)'")
        }
    }

    return @($result)
}
