
PROJECT=trend-hearts
REGISTRY=ai.registry.trendmicro.com

## Build an image
## Create a tag with practice an rank
## Push images with practice and rank to Docker registry
auto:
	sudo docker build -t $(PROJECT):latest -f Dockerfile .
	sudo docker tag $(PROJECT):latest $(REGISTRY)/$(team)/$(PROJECT):practice
	sudo docker tag $(PROJECT):latest $(REGISTRY)/$(team)/$(PROJECT):rank
	sudo docker push $(REGISTRY)/$(team)/$(PROJECT):practice
	sudo docker push $(REGISTRY)/$(team)/$(PROJECT):rank

## Build an image
build:
	sudo docker build -t $(PROJECT):latest -f Dockerfile .

## Run a new container
run:
	sudo docker run -it --rm $(PROJECT):latest $(name) $(number) $(token) $(server)

## Create a tag with practice
tag-practice:
	sudo docker tag $(PROJECT):latest $(REGISTRY)/$(team)/$(PROJECT):practice

## Remove image which is tagged with practice
untag-practice:
	sudo docker rmi $(REGISTRY)/$(team)/$(PROJECT):practice

## Create a tag with rank
tag-rank:
	sudo docker tag $(PROJECT):latest $(REGISTRY)/$(team)/$(PROJECT):rank

## Remove image which is tagged with rank
untag-rank:
	sudo docker rmi $(REGISTRY)/$(team)/$(PROJECT):rank

## Create a tag with practice an rank
tag-all:
	sudo docker tag $(PROJECT):latest $(REGISTRY)/$(team)/$(PROJECT):practice
	sudo docker tag $(PROJECT):latest $(REGISTRY)/$(team)/$(PROJECT):rank

## Log in to a Docker registry
login:
	sudo docker login $(REGISTRY)

## Push an image with practice to Docker registry
push-practice:
	sudo docker push $(REGISTRY)/$(team)/$(PROJECT):practice

## Push an image with rank to Docker registry
push-rank:
	sudo docker push $(REGISTRY)/$(team)/$(PROJECT):rank

## Push images with practice and rank to Docker registry
push-all:
	sudo docker push $(REGISTRY)/$(team)/$(PROJECT):practice
	sudo docker push $(REGISTRY)/$(team)/$(PROJECT):rank

## Clean untagged images
clean:
	sudo docker rmi $$(sudo docker images -f "dangling=true" -q)