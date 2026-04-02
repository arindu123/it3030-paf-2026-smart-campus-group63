package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.ResourceRequest;
import com.sliit.smartcampus.dto.ResourceStatusUpdateRequest;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.service.ResourceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    public Resource createResource(@RequestBody ResourceRequest request) {
        return resourceService.createResource(request);
    }

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceService.getAllResources();
    }

    @GetMapping("/{id}")
    public Resource getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id);
    }

    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable Long id, @RequestBody ResourceRequest request) {
        return resourceService.updateResource(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return "Resource deleted successfully";
    }

    @PatchMapping("/{id}/status")
    public Resource updateResourceStatus(@PathVariable Long id,
                                         @RequestBody ResourceStatusUpdateRequest request) {
        return resourceService.updateResourceStatus(id, request.getStatus());
    }
}