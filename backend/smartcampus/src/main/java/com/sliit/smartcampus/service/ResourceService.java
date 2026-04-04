package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.ResourceRequest;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.enums.ResourceStatus;

import java.util.List;

public interface ResourceService {

    Resource createResource(ResourceRequest request);

    List<Resource> getAllResources();

    Resource getResourceById(Long id);

    Resource updateResource(Long id, ResourceRequest request);

    void deleteResource(Long id);

    Resource updateResourceStatus(Long id, ResourceStatus status);
}