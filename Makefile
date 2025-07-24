all: checkov


checkov:
	# Checkov static analysis
	checkov


yor:
	# Update Yor tags
	yor tag -d .


atmos-validate:
	# Validate Atmos stacks and schemas
	cd infra && atmos validate stacks && atmos validate schema


atmos-describe:
	# Generate stack descriptions
	cd infra && atmos describe stacks


test-infra:
	# Run complete infrastructure test suite
	cd infra && npm run test:infra


git_sync:
	# Synchronize with Github
	git checkout master
	git pull
	git remote prune origin | grep pruned | cut -d' ' -f4 | sed 's/origin\///' | xargs -I {} git branch -D {} 2>/dev/null

